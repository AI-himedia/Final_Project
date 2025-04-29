package com.aix.againhello.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/be/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/query")
    public ResponseEntity<String> query(@RequestBody Map<String, Object> body) {
        String response = adminService.callFastApi("admin/query", body);
        System.out.println("response : " + response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/nl2sql")
    public ResponseEntity<String> nl2sql(@RequestBody Map<String, Object> body) {
        String response = adminService.callFastApi("admin/nl2sql", body);
        System.out.println("response : " + response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/nl2rag")
    public ResponseEntity<String> nl2rag(@RequestBody Map<String, Object> body) {
        String response = adminService.callFastApi("admin/nl2rag", body);
        System.out.println("response : " + response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rag")
    public ResponseEntity<String> admin(@RequestBody Map<String, Object> body) {
        String response = adminService.callFastApi("admin/rag", body);
        System.out.println("response : " + response);
        return ResponseEntity.ok(response);
    }


}
