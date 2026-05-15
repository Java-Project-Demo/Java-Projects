package org.dawn.backend.controller.system;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dawn.backend.config.security.SecurityContext;
import org.dawn.backend.config.web.annotation.Post;
import org.dawn.backend.config.web.response.ResponseObject;
import org.dawn.backend.controller.base.AbstractController;
import org.dawn.backend.dto.system.ChatRequest;
import org.dawn.backend.service.system.AiAgentService;

@RequiredArgsConstructor
public class AiAgentController extends AbstractController {
    private final AiAgentService agentService;

    @Post("/chat")
    public ResponseObject<String> chat(HttpServletRequest req, HttpServletResponse res) {
        String role = SecurityContext.get().role();
        String sessionId = req.getSession().getId();
        ChatRequest dto = body(req, ChatRequest.class);
        String answer = agentService.chat(sessionId, role, dto.getMessage());
        return ResponseObject.success(answer);
    }

    @Post("/suggest")
    public ResponseObject<String> suggest(HttpServletRequest req, HttpServletResponse res) {
        ChatRequest dto = body(req, ChatRequest.class);
        String answer = agentService.suggest(dto.getMessage());
        return ResponseObject.success(answer);
    }
}
