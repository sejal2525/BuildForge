import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 20,
  duration: '30s',
};

export default function () {
  http.post('http://localhost:3000/appointment', JSON.stringify({
    name: "LoadUser",
    doctor: "Dr Ravi",
    date: "2026-05-01"
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  sleep(1);
}