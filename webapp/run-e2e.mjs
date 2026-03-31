import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import path from 'path';

// Here we create a database for the e2e tests reusing the same init.sql file that
// uses the production database.
console.log('Starting test containers');

//1. Configuring and building the testing container
const postgresContainer = await new PostgreSqlContainer('postgres:15-alpine')
  .withDatabase('yovi_test')
  .withUsername('test')
  .withPassword('1234')
  .withCopyFilesToContainer([{
    source: path.resolve(process.cwd(), '../users/src/db/init.sql'),
    target: '/docker-entrypoint-initdb.d/init.sql'
  }])
  .start();

const dynamicPort = postgresContainer.getPort();
console.log(`Testing datatabase ready in port: ${dynamicPort}`);

try {
  // 2. Executing the e2e command defined in package.json passing the dynamic variables
  console.log('Building Backend, Frontend and executing Playwright/Cucumber...');
  
  execSync(
    `cross-env DB_HOST=localhost DB_PORT=${dynamicPort} DB_USER=test DB_PASSWORD=1234 DB_NAME=yovi_test npm run test:e2e:ci`, 
    { stdio: 'inherit' } // We can see the logs in the console
  );

} catch (error) {
  console.error('The tests have failed, removing testing db');
  process.exitCode = 1; // We alert Github actions that the process failed
} finally {
  // 3. Destroying the container
  console.log('Destroying the container...');
  await postgresContainer.stop();
  console.log('Process ended!');
}