package org.dawn.backend.controller.system;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.dto.system.ChatRequest;
import org.dawn.backend.dto.system.ChatResponse;
import org.dawn.backend.service.system.AiAgentService;
import org.dawn.backend.utils.SecurityContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/agent")
@RequiredArgsConstructor
public class AiAgentController {
    private final AiAgentService agentService;


    @PostMapping("/chat")
    public ResponseObject<ChatResponse> chat(@RequestBody ChatRequest dto, HttpSession session) {
        String role = SecurityContext.getCurrentRole();
        String sessionId = session.getId();
        ChatResponse answer = agentService.chat(sessionId, role, dto.getMessage());
        return ResponseObject.success(answer);
    }

    @PostMapping("/suggest")
    public ResponseObject<String> suggest(@RequestBody ChatRequest dto) {
        String answer = agentService.suggest(dto.getMessage());
        return ResponseObject.success(answer);
    }
}
