import configRollbar from './config';
import { peerDependencies } from './package.json';

export default configRollbar({
  input: ['src/index.ts', 'src/Auth.tsx', 'src/firebaseAsync.tsx'],
  peerDependencies,
  globals: {
    react: 'React',
    'firebase/app': 'firebase',
  },
  format: 'umd',
});
