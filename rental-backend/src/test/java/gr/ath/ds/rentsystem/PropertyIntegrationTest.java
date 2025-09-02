package gr.ath.ds.rentsystem;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PropertyIntegrationTest extends AbstractIntegrationTest {

    @Test
    void public_search_returns_200() throws Exception {
        mockMvc.perform(get("/api/properties?page=0&size=10"))
                .andExpect(status().isOk());
    }

    @Test
    void owner_list_my_properties_returns_200() throws Exception {
        String ownerToken = loginAndGetToken("owner@system.gr", "12345");

        mockMvc.perform(get("/api/properties/my?page=0&size=10")
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk());
    }

    @Test
    void admin_can_approve_property() throws Exception {
        String adminToken = loginAndGetToken("admin@system.gr", "12345");

        mockMvc.perform(post("/api/properties/1/approve")
                        .header("Authorization", bearer(adminToken)))
                // αν είναι ήδη APPROVED μπορεί να δώσει 409 — κάνε accept και τα δύο
                .andExpect(result -> {
                    int sc = result.getResponse().getStatus();
                    if (sc != 204 && sc != 409) {
                        throw new AssertionError("Expected 204 or 409, got " + sc);
                    }
                });
    }

    @Test
    void owner_can_create_property() throws Exception {
        String ownerToken = loginAndGetToken("owner@system.gr", "12345");

        String body = """
          {
            "title": "Test Listing",
            "description": "Nice place",
            "address": "1 Main St",
            "city": "Egaleo",
            "price": 500.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "size": 45,
            "type": "APARTMENT"
          }
        """;

        mockMvc.perform(post("/api/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists());
    }
}

