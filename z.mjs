import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://bpepafbgodcyxcdsejkm.storage.supabase.co/storage/v1/s3","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZXBhZmJnb2RjeXhjZHNlamttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg0MDc1OSwiZXhwIjoyMDcyNDE2NzU5fQ.n1O9hZ-RuT8YGoV6oBNEzVaVclRVgIhKZXZJZgsxfJE");

async function uploadFile(file) {
  const { data, error } = await supabase.storage.from('bucket_name').upload('file_path', file)
  if (error) {
    console.log('Error uploading file:', error);
  } else {
    console.log('File uploaded successfully:', data);
  }
}

uploadFile("/Users/swapnilshinde/Desktop/p3ai/asli-trust/docker-compose.yml")