package com.navi.common.util;

import org.springframework.stereotype.Component;

@Component
public class IdGenerator {
    /*
     * Synchronized
     * 여러 쓰레드가 같은 객체의 메서드에 동시 접근하지 못하도록 잠금을 거는 것
     * 한 쓰레드가 해당 메서드를 실행 중이면, 다른 쓰레드는 해당 코드에 들어오지 못하고 대기상태가 됨...
     */
    public String generateNextId(String prefix, long seqValue) {
        // prefix 예 : "ACC", maxId 예 : "ACC001"
        // int num = Integer.parseInt(maxId.replace(prefix,""));
        // return String.format("%s%05d", prefix, num + 1);

        // prefix 예: "ACC", seqValue 예: 1
        return String.format("%s%05d", prefix, seqValue);
    }
}
