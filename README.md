# digital-asset-manager

A centralize and scalable solution to manage large volume of digital assets like images, videos and documents.

## How to build and run the app

### For development:

- Database setup using migrations

  > npx sequelize-cli db:create
  > npx sequelize-cli db:migrate

- Generate API keys and add environment variables for various services

  > npm run generate:internal-keys

- Execute following commands using different terminals to run API server and BullMQ workers

  > npm run dev or (npm run build)
  > npm run worker:image
  > npm run worker:video

Also ensure that the Redis server and MinIO is installed and running.

- Installation of Redis on Docker
  > docker run -d --name redis-server -p 6379:6379 redis
- Installation of MinIO on Docker (on Powershell use backtick instead of backslash at line end for multiline command)
  > docker run -d \
  >
  > > --name minio \
  > > -p 9000:9000 \
  > > -p 9001:9001 \
  > > -e MINIO_ROOT_USER=minioadmin \
  > > -e MINIO_ROOT_PASSWORD=MinioAdminPwd \
  > > -v E:\ProjectsWorkspace\DB\minio:/data \
  > > quay.io/minio/minio server /data --console-address ":9001"

For video processing ffmpeg is used. Install the application on the OS and add bin folder to the PATH environment variable.

### For production:

- Database setup using migrations

  > npx sequelize-cli db:create
  > npx sequelize-cli db:migrate

- TODO

## **Digital Asset Management (DAM) Platform**

Companies today generate and manage a large volume of digital assets — including images, videos, and documents — across multiple teams, projects, and marketing channels. However, most businesses lack a centralized and scalable solution to:

- Upload multiple large files efficiently
- Process assets in the background (e.g., generate thumbnails, compress videos, extract metadata)
- Tag, categorize, and search assets based on content
- Allow teams to preview, download, and share assets securely
- Scale processing and storage as the volume grows

## Scope of work

### **1. User Flow**

- Upload multiple files (images/videos) via frontend (drag-and-drop or API)
- View uploaded files in a gallery with search and filters
- Download or preview files in browser
- Auto-tag assets using filename, MIME, and basic metadata

### **2. Background Processing (BullMQ workers)**

- Generate thumbnails for images
- Transcode videos to multiple resolutions (1080p, 720p)
- Extract metadata (file type, size, dimensions)
- Store all assets in object storage (MinIO or S3)

### **3. Dashboard (Admin View)**

- Asset browser with filters: type, date, tags
- Download counts, upload counts, latest assets
- Asset usage analytics (dummy or from Redis stats)

### **4. Architecture/DevOps**

- Use Docker + Docker Swarm to orchestrate:
  - API service
  - Worker service (asset processor)
  - Redis + BullMQ dashboard
  - Object storage (MinIO)
- Scale workers based on queue size

## **Tech Stack**

- Frontend: React + Tailwind
- Backend: Node.js + Express
- Queue: BullMQ + Redis
- Object Storage: MinIO
- Video/Image tools: FFmpeg, Sharp
- Deployment: Docker Swarm (with scale configs)
