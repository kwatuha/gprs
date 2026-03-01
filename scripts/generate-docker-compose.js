#!/usr/bin/env node
// scripts/generate-docker-compose.js
// Generate docker-compose.yml from county configuration

const fs = require('fs');
const path = require('path');
const { getCountyConfig } = require('../api/config/countyConfig');

// Set COUNTY_CODE from environment or command line argument
const countyCode = process.argv[2] || process.env.COUNTY_CODE || 'default';
process.env.COUNTY_CODE = countyCode;

const config = getCountyConfig();
const outputPath = path.join(__dirname, '..', 'docker-compose.yml');

const dockerComposeTemplate = `version: '3.8'
services:
  nginx_proxy:
    image: nginx:alpine
    container_name: ${config.docker.containers.nginx}
    ports:
      - "${config.docker.ports.nginx}:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - api

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ${config.docker.containers.frontend}
    restart: unless-stopped
    ports:
      - "${config.docker.ports.frontend}:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - api
    command: npm run dev
    environment:
      - COUNTY_CODE=${countyCode.toUpperCase()}
      - VITE_COUNTY_CODE=${countyCode.toUpperCase()}

  public-dashboard:
    build:
      context: ./public-dashboard
      dockerfile: Dockerfile
    container_name: ${config.docker.containers.publicDashboard}
    restart: unless-stopped
    ports:
      - "${config.docker.ports.publicDashboard}:5173"
    volumes:
      - ./public-dashboard:/app
      - /app/node_modules
    depends_on:
      - api
    command: npm run dev
    environment:
      - VITE_API_URL=/api
      - VITE_MAPS_API_KEY=AIzaSyArNdYrq_WsuoGc34C7Osua7kbpt2Twf_s
      - COUNTY_CODE=${countyCode.toUpperCase()}
      - VITE_COUNTY_CODE=${countyCode.toUpperCase()}

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: ${config.docker.containers.api}
    ports:
      - "${config.docker.ports.api}:3000"
    volumes:
      - ./api:/app
      - /app/node_modules
    depends_on:
      mysql_db:
        condition: service_healthy
    environment:
      COUNTY_CODE: ${countyCode.toUpperCase()}
      DB_HOST: ${config.docker.containers.mysql}
      DB_USER: impesUser
      DB_PASSWORD: Admin2010impes
      DB_NAME: ${config.database.name}
    command: npm run dev

  mysql_db:
    image: mysql:8.0
    container_name: ${config.docker.containers.mysql}
    restart: always
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: ${config.database.name}
      MYSQL_USER: impesUser
      MYSQL_PASSWORD: Admin2010impes
    volumes:
      - ./${config.database.seedFile}:/docker-entrypoint-initdb.d/init.sql
      - ${config.docker.volumes.mysql}:/var/lib/mysql
    ports:
      - "${config.docker.ports.mysql}:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_password"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  ${config.docker.volumes.mysql}:
`;

try {
  fs.writeFileSync(outputPath, dockerComposeTemplate, 'utf8');
  console.log(`✓ Generated docker-compose.yml for ${config.county.name} (${config.county.code})`);
  console.log(`  - Database: ${config.database.name}`);
  console.log(`  - Seed file: ${config.database.seedFile}`);
  console.log(`  - Ports: nginx=${config.docker.ports.nginx}, api=${config.docker.ports.api}, mysql=${config.docker.ports.mysql}`);
} catch (error) {
  console.error('Error generating docker-compose.yml:', error);
  process.exit(1);
}

