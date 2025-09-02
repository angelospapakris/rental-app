package gr.ath.ds.rentsystem;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ViewingRequestIntegrationTest extends AbstractIntegrationTest {

    @Test
    void tenant_request_viewing_returns_200_or_409() throws Exception {
        String tenantToken = loginAndGetToken("tenant@system.gr", "12345");

        String body = """
      { "notes": "Prefer afternoon slots." }
    """;

        mockMvc.perform(post("/api/viewings?propertyId=2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", bearer(tenantToken)))
                .andDo(print())
                .andExpect(result -> {
                    int sc = result.getResponse().getStatus();
                    if (sc != 200 && sc != 409) {
                        throw new AssertionError("Expected 200 or 409, got " + sc +
                                " body=" + result.getResponse().getContentAsString());
                    }
                });
    }

    @Test
    void tenant_list_my_viewings_returns_200() throws Exception {
        String tenantToken = loginAndGetToken("tenant@system.gr", "12345");

        mockMvc.perform(get("/api/viewings/my?page=0&size=10")
                        .header("Authorization", bearer(tenantToken)))
                .andExpect(status().isOk());
    }

    @Test
    void owner_list_viewings_for_my_properties_returns_200() throws Exception {
        String ownerToken = loginAndGetToken("owner@system.gr", "12345");

        mockMvc.perform(get("/api/viewings/owner?page=0&size=10")
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk());
    }

    @Test
    void owner_confirm_decline_complete_should_be_2xx_or_409() throws Exception {
        String ownerToken = loginAndGetToken("owner@system.gr", "12345");

        // Διάλεξε ένα id που υπάρχει από seed (π.χ. 1)
        long viewingId = 1L;

        mockMvc.perform(post("/api/viewings/{id}/confirm", viewingId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(result -> {
                    int sc = result.getResponse().getStatus();
                    if (sc != 204 && sc != 409 && sc != 404) {
                        throw new AssertionError("Expected 204/409/404, got " + sc);
                    }
                });

        mockMvc.perform(post("/api/viewings/{id}/decline", viewingId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(result -> {
                    int sc = result.getResponse().getStatus();
                    if (sc != 204 && sc != 409 && sc != 404) {
                        throw new AssertionError("Expected 204/409/404, got " + sc);
                    }
                });

        mockMvc.perform(post("/api/viewings/{id}/complete", viewingId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(result -> {
                    int sc = result.getResponse().getStatus();
                    if (sc != 204 && sc != 409 && sc != 404) {
                        throw new AssertionError("Expected 204/409/404, got " + sc);
                    }
                });
    }
}
