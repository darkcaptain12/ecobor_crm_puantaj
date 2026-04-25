import { ShieldOff } from 'lucide-react';

export default function ErisimEngellendi() {
  return (
    <div className="min-h-screen bg-eco-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-3xl mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-eco-text mb-3">Erişim Engellendi</h1>
        <p className="text-eco-text-2 mb-2">
          Bu sisteme dışarıdan erişim kısıtlanmıştır.
        </p>
        <p className="text-eco-text-2 text-sm mb-8">
          Erişim için şirket ağına bağlanmanız ya da yöneticinizden uzak erişim izni almanız gerekmektedir.
        </p>
        <div className="bg-white rounded-xl border border-eco-border p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-eco-gray uppercase tracking-wide">Ne yapabilirsiniz?</p>
          <ul className="text-sm text-eco-text-2 space-y-1.5">
            <li>• Şirket ağına (VPN veya ofis) bağlanın</li>
            <li>• Yöneticinizden uzak erişim açmasını isteyin</li>
            <li>• Destek için sistem yöneticisiyle iletişime geçin</li>
          </ul>
        </div>
        <p className="text-xs text-eco-gray mt-6">© 2026 Ecobor Tarım</p>
      </div>
    </div>
  );
}
