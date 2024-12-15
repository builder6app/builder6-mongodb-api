import ExpressApplication from './app.express';

export async function bootstrap() {
  const app = await ExpressApplication();
  await app.listen(process.env.B6_PORT ?? 5100);
}
bootstrap();
