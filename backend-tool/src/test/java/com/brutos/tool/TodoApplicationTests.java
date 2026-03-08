package com.brutos.tool;

import com.brutos.tool.entity.Todo;
import com.brutos.tool.service.TodoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

//  We create a `@SpringBootTest`, starting an actual server on a `RANDOM_PORT`
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class TodoApplicationTests {

    @Test
    void contextLoads() {
    }

    // Spring Boot will create a `WebTestClient` for you,
    // already configure and ready to issue requests against "localhost:RANDOM_PORT"
    @Autowired
    private WebTestClient webTestClient;

    @Test
    public void testTask() {
        Todo expectedTodo = new Todo(TodoService.NOTHING_TO_DO, LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

        // When
        WebTestClient.ResponseSpec actual = webTestClient
                // Create a GET request to test an endpoint
                .get().uri("/task")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectAll(
                        responseSpec -> responseSpec.expectStatus().isOk(),
                        responseSpec -> responseSpec.expectBody(Todo.class).isEqualTo(expectedTodo)
                );
    }

}
