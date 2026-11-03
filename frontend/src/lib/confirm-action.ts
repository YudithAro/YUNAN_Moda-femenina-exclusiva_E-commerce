export interface ConfirmationRequest {
  title: string;
  description: string;
  confirmLabel?: string;
}

export function confirmAction(request: ConfirmationRequest): Promise<boolean> {
  return new Promise(resolve => {
    const event = new CustomEvent('yunan:confirm', { cancelable: true, detail: { ...request, resolve } });
    if (window.dispatchEvent(event)) resolve(window.confirm(`${request.title}\n\n${request.description}`));
  });
}
