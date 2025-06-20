package ar.uba.fi.ingsoft1.todo_template;

import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.metamodel.Metamodel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TodoTemplateApplication {

	public static void main(String[] args) {
		SpringApplication.run(TodoTemplateApplication.class, args);
	}

	@Bean
	public CommandLineRunner logEntities(EntityManagerFactory emf) {
		return args -> {
			Metamodel metamodel = emf.getMetamodel();
			System.out.println("Entidades detectadas por Hibernate:");
			metamodel.getEntities().forEach(e -> System.out.println(" - " + e.getName()));
		};
	}

}
