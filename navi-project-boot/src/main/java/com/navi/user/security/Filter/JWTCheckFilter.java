//package com.navi.user.security.Filter;
//
//import com.google.gson.Gson;
//import com.navi.common.response.ApiResponse;
//import com.navi.user.security.util.JWTUtil;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.io.PrintWriter;
//import java.util.Map;
//
//@RequiredArgsConstructor
//public class JWTCheckFilter extends OncePerRequestFilter {
//    private final JWTUtil jwtUtil;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        String authHeaderString = request.getHeader("Authorization");
//        try{
//            String accessToken = authHeaderString.substring(7);
//            Map<String, Object> claims = jwtUtil.validateToken(accessToken);
//            filterChain.doFilter(request, response);
//        } catch (Exception e) {
//            Gson gson = new Gson();
//            ApiResponse<Object> apiResponse = ApiResponse.error("잘못/만료 된 토큰입니다.", 401, null);
//
//            response.setContentType("application/json; charset=UTF-8");
//            PrintWriter printWriter = response.getWriter();
//            printWriter.println(apiResponse);
//            printWriter.close();
//        }
//    }
//
//    @Override
//    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
//        // CORS 요청 전에 사전 요청 시 건너뜀
//        if(request.getMethod().equals("OPTIONS")){
//            return true;
//        }
//
//        String path = request.getRequestURI();
//
//        // 로그인 없이 접근 가능한 페이지 건너뜀
//        if(path.startsWith("/api/users/signup") || path.startsWith("/api/users/login") || path.startsWith("/api/travels/") ||
//                path.startsWith("/api/transports") || path.startsWith("/api/accommodations") || path.startsWith("/api/posts") ||
//                path.startsWith("/api/notices") || path.startsWith("/flight") || path.startsWith("/api/login-try/**")){
//            return true;
//        }
//
//        return false;
//    }
//}
