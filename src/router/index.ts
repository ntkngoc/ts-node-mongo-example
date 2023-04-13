import express from 'express';
import authentication from './auth-router';
import user from './user-router';

const router = express.Router();

export default (): express.Router => {
  authentication(router)
  user(router)
  return router;
};