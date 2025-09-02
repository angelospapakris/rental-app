package gr.ath.ds.rentsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RentalSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(RentalSystemApplication.class, args);
//		String raw = "12345";
//		String encoded = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(11).encode(raw);
//		System.out.println("BCrypt hash = "+encoded);
	}
}
