import http from 'k6/http';
import { check } from 'k6';
import { readFileSync } from 'fs';

const url = 'http://localhost:5100/api/v6/files/cfs.files.record';
const apiKey = '';
const filePath = './path/to/your/file.txt';
const fileContent = readFileSync(filePath, { encoding: 'binary' }); // 以二进制方式读取文件

export let options = {
  vus: 10, // 并发虚拟用户数量
  duration: '30s', // 测试持续时间
};

export default function () {

  // 读取本地文件内容

  const payload = http.file(
    fileContent,
    'file.txt', // 替换为你的文件名
    'text/plain' // 替换为你的文件 MIME 类型
  );

  const headers = {
    Authorization: `Bearer apikey,${apiKey}`, // 如果需要认证，替换为实际 token
    'Content-Type': 'multipart/form-data',
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    'is status 200': (r) => r.status === 200,
    'response contains success': (r) => r.body.includes('success'), // 根据你的接口返回内容修改
  });
}
