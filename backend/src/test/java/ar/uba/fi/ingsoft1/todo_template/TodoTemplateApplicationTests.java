package ar.uba.fi.ingsoft1.todo_template;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class TodoTemplateApplicationTests {

	@Test
	void contextLoads() {
	}

}
