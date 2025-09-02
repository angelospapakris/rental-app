package gr.ath.ds.rentsystem;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthIntegrationTest extends AbstractIntegrationTest {

    @Test
    void login_as_admin_should_return_token() throws Exception {
        String token = loginAndGetToken("admin@system.gr", "12345");
        org.junit.jupiter.api.Assertions.assertFalse(token.isBlank());
    }

    @Test
    void login_with_wrong_password_should_fail() throws Exception {
        var body = """
          {"usernameOrEmail":"admin@system.gr","password":"WRONG"}
        """;
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is4xxClientError());
    }
}
