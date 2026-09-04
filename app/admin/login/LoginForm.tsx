'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';
import styles from '../admin.module.css';

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className={styles.loginForm}>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      {state.error ? <p className={styles.formError} role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in securely'}
      </button>
    </form>
  );
}
