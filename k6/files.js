import http from 'k6/http';
import { sleep, check } from 'k6';

const url = 'http://127.0.0.1:5100/api/v6/files/cfs.files.filerecord';
const token = 'apikey,W0uafl4P7u8uAH9TSCibg1M5s8IaOj3qmHmgSa2lUZu';
const filePath = '/Users/steedos/Downloads/test.pdf';
const fileContent = open(filePath, 'b') // 以二进制方式读取文件
console.log(fileContent);


export let options = {
  vus: 20, // 并发虚拟用户数量
  duration: '5s', // 测试持续时间
};

export default function () {

  // 读取本地文件内容

  const payload = {
    file: http.file(fileContent, 'test.pdf'),
  };

  const headers = {
    Authorization: `Bearer ${token}`, // 如果需要认证，替换为实际 token
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    'is status 201': (r) => r.status === 201,
    'response contains file ID': (r) => r.json()._id !== undefined, // 假设返回内容包含文件 ID
  });
}
