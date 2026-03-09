package com.brutos.tool.integration;

import com.brutos.tool.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//  We create a `@SpringBootTest`, starting an actual server on a `RANDOM_PORT`
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
public class TaskApplicationIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    public void givenTaskTodayURI_whenMockMVC_thenVerifyResponse() throws Exception {
        String expectedWhen = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        // Given/When/Then
        MvcResult mvcResult = this.mockMvc.perform(get("/api/task/today").accept(MediaType.APPLICATION_JSON).acceptCharset(StandardCharsets.UTF_8))
                // NOTE : on peut tester diretement le résultat attendu ici
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.what").value(TaskService.NOTHING_TO_DO))
                .andExpect(jsonPath("$.when").value(expectedWhen))
                .andReturn();

        // Then
        assertEquals(MediaType.APPLICATION_JSON + ";charset=UTF-8", mvcResult.getResponse().getContentType());
    }
}
