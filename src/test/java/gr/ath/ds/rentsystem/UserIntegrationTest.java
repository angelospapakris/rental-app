package gr.ath.ds.rentsystem;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserIntegrationTest extends AbstractIntegrationTest {

    @Test
    void get_users_requires_admin_and_returns_200() throws Exception {
        String adminToken = loginAndGetToken("admin@system.gr", "12345");

        mockMvc.perform(get("/api/users?page=0&size=10")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk());
    }

    @Test
    void activate_user_as_admin_returns_204() throws Exception {
        String adminToken = loginAndGetToken("admin@system.gr", "12345");

        mockMvc.perform(post("/api/users/3/activate")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());
    }

    @Test
    void non_admin_cannot_access_users_403() throws Exception {
        String tenantToken = loginAndGetToken("tenant@system.gr", "12345");

        mockMvc.perform(get("/api/users?page=0&size=10")
                        .header("Authorization", bearer(tenantToken)))
                .andExpect(status().isForbidden());
    }
}
