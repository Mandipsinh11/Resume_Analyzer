import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function run() {
  try {
    const filePath = 'dummy.pdf';
    fs.writeFileSync(filePath, 'dummy pdf content for testing');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    console.log('Sending request to http://localhost:5001/api/ai-resume/upload');
    const res = await axios.post('http://localhost:5001/api/ai-resume/upload', form, {
      headers: form.getHeaders()
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Server responded with error:', err.response.status, err.response.data);
    } else {
      console.error('Network error:', err.message);
    }
  }
}

run();
