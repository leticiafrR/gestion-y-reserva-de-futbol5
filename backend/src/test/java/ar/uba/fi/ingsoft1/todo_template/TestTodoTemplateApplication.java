package ar.uba.fi.ingsoft1.todo_template;

import org.springframework.boot.SpringApplication;

public class TestTodoTemplateApplication {

	public static void main(String[] args) {
		SpringApplication.from(TodoTemplateApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
