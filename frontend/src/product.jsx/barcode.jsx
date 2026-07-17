import BarcodeScannerComponent from "react-qr-barcode-scanner"

export default function Barcode({ onScan, close }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>Scan Barcode</h3>
                <button
                    onClick={close}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>
            <BarcodeScannerComponent
                width="100%"
                height={260}
                onUpdate={(err, result) => {
                    if (result) {
                        const code = result.getText ? result.getText() : result.text
                        if (code) onScan(code)
                    }
                }}
            />
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '10px' }}>
                Point your camera at a barcode
            </p>
        </div>
    )
}
