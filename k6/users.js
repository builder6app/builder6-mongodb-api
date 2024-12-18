import http from 'k6/http';
import { sleep, check } from 'k6';

const url = 'http://127.0.0.1:5100/api/v6/direct/users?skip=0&top=20';
const token = 'apikey,W0uafl4P7u8uAH9TSCibg1M5s8IaOj3qmHmgSa2lUZu';


export let options = {
  vus: 2, // 并发虚拟用户数量
  duration: '5s', // 测试持续时间
};

export default function () {

  const headers = {
    Authorization: `Bearer ${token}`, // 如果需要认证，替换为实际 token
    'Content-Type': 'multipart/form-data',
  };

  const res = http.get(url, { headers });

  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}
