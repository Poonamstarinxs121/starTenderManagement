declare module 'wouter' {
  export function useLocation(): [string, string];
  export function Link(props: { href: string; children: React.ReactNode; className?: string }): JSX.Element;
} 