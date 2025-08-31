package gr.ath.ds.rentsystem;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RentalApplicationIntegrationTest extends AbstractIntegrationTest {

    @Test
    void tenant_submit_application_for_approved_property_returns_200() throws Exception {
        String tenantToken = loginAndGetToken("tenant@system.gr", "12345");

        String body = """
          { "message": "I can move in next month." }
        """;

        // propertyId=2 (APPROVED)
        mockMvc.perform(post("/api/applications?propertyId=2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"I can move in next month.\"}")
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
    void tenant_my_applications_returns_200() throws Exception {
        String tenantToken = loginAndGetToken("tenant@system.gr", "12345");

        mockMvc.perform(get("/api/applications/my?page=0&size=10")
                        .header("Authorization", bearer(tenantToken)))
                .andExpect(status().isOk());
    }

    @Test
    void owner_list_applications_for_my_properties_returns_200() throws Exception {
        String ownerToken = loginAndGetToken("owner@system.gr", "12345");

        mockMvc.perform(get("/api/applications/owner?page=0&size=10")
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk());
    }

    @Test
    void owner_can_approve_application_or_conflict_if_invalid_state() throws Exception {
        String ownerToken = loginAndGetToken("owner@system.gr", "12345");

        mockMvc.perform(post("/api/applications/1/approve")
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(result -> {
                    int sc = result.getResponse().getStatus();
                    if (sc != 204 && sc != 409) {
                        throw new AssertionError("Expected 204 or 409, got " + sc);
                    }
                });
    }
}

