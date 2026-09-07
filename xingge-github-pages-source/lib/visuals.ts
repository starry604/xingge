export function mountVisuals(enabled: boolean): () => void {
  let disposed = false;
  const cleanups: (() => void)[] = [];
  const attach = (mount: (enabled:boolean) => (() => void)) => { if (!disposed) cleanups.push(mount(enabled)); };
  void import('./visuals-orbit').then(m => attach(m.mountOrbit)).catch(() => {});
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      if (entry.target.id === 'network-mount') void import('./visuals-network').then(m => attach(m.mountNetwork)).catch(() => {});
      if (entry.target.id === 'flow-mount') void import('./visuals-flow').then(m => attach(m.mountFlow)).catch(() => {});
    }
  }, { rootMargin: '250px' });
  for (const id of ['network-mount', 'flow-mount']) { const host = document.getElementById(id); if (host) observer.observe(host); }
  return () => { disposed = true; observer.disconnect(); cleanups.forEach(release => release()); };
}
