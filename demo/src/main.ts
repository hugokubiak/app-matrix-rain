import { MatrixRain } from 'app-matrix-rain';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('app-matrix-rain demo: #app not found');
}

const rain = new MatrixRain(app, { charset: 'latin' });
rain.start();
