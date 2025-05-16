// Sample data for demonstration
export interface SampleData {
  id: string
  name: string
  description: string
  data: string // raw data
  fileName: string
  type: "text" | "json" | "binary" | "html" | "csv"
}

// Raw samples for compression/decompression
export const samples: SampleData[] = [
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Text",
    description: "A sample of Lorem Ipsum text",
    data: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, 
nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, 
eget aliquam nisl nisl eget nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, 
nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, 
eget aliquam nisl nisl eget nisl.`.repeat(10),
    fileName: "lorem-ipsum.txt",
    type: "text",
  },
  {
    id: "json-data",
    name: "JSON Data",
    description: "A sample of JSON data",
    data: JSON.stringify(
      {
        users: [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            active: true,
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "user",
            active: true,
          },
          {
            id: 3,
            name: "Bob Johnson",
            email: "bob@example.com",
            role: "user",
            active: false,
          },
        ],
        metadata: {
          total: 3,
          active: 2,
          lastUpdated: "2023-05-20T12:30:45Z",
        },
      },
      null,
      2,
    ),
    fileName: "data.json",
    type: "json",
  },
  {
    id: "csv-data",
    name: "CSV Data",
    description: "A sample of CSV data with records",
    data: `id,name,email,phone,registered_date
1,"John Doe","john@example.com","+1-555-123-4567","2023-01-15"
2,"Jane Smith","jane@example.com","+1-555-789-0123","2023-02-28"
3,"Bob Johnson","bob@example.com","+1-555-456-7890","2023-03-10"
4,"Alice Williams","alice@example.com","+1-555-123-9876","2023-04-05"
5,"Charlie Brown","charlie@example.com","+1-555-789-4561","2023-05-20"`,
    fileName: "users.csv",
    type: "csv",
  },
  {
    id: "html-snippet",
    name: "HTML Snippet",
    description: "A sample of HTML code",
    data: `<!DOCTYPE html>
<html>
<head>
  <title>Sample HTML Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    h1 {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sample HTML Page</h1>
    <p>This is a sample HTML page that has been compressed with LZ4.</p>
    <p>The LZ4 algorithm is a lossless data compression algorithm that is focused on compression and decompression speed.</p>
    <ul>
      <li>Fast compression and decompression</li>
      <li>Low memory requirements</li>
      <li>Suitable for real-time compression</li>
    </ul>
  </div>
</body>
</html>`,
    fileName: "sample.html",
    type: "html",
  },
]

// Get a sample by ID
export function getSampleById(id: string): SampleData | undefined {
  return samples.find((sample) => sample.id === id)
}
