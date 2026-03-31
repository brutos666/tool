package com.brutos.tool.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//  We create a `@SpringBootTest`, starting an actual server on a `RANDOM_PORT`
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ItemApplicationIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    public void givenItemTodoURI_whenMockMVC_thenVerifyResponse() throws Exception {
        // Given/When/Then
        MvcResult mvcResult = this.mockMvc.perform(get("/api/item/findAllItems").accept(MediaType.APPLICATION_JSON).acceptCharset(StandardCharsets.UTF_8))
                // NOTE : on peut tester directement le résultat attendu ici
                .andExpect(status().isOk())
                //.andExpect(jsonPath("$.text").value(ItemService.NOTHING_TO_DO))
                .andReturn();

        // Then
        assertEquals(MediaType.APPLICATION_JSON + ";charset=UTF-8", mvcResult.getResponse().getContentType());
    }
}
