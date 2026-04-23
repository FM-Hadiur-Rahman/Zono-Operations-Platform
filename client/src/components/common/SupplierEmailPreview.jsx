export default function SupplierEmailPreview({
  isOpen,
  onClose,
  supplierOrder,
  mainOrder,
  location,
}) {
  if (!isOpen || !supplierOrder) return null;

  const subject = `New Purchase Order - ${location?.name || "Branch"} - ${supplierOrder.supplierOrderNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#eadccf] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eadccf] px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9a7b5f]">
              Supplier Email Preview
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#1f140f]">
              {supplierOrder.supplier.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#d8c6b7] bg-white px-4 py-2 text-sm font-medium text-[#2d1c13] hover:bg-[#f8f2ec]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6">
          <div className="rounded-2xl border border-[#eadccf] bg-[#fffdfa] p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a7b5f]">
              Email Subject
            </p>
            <p className="mt-2 text-base font-semibold text-[#1f140f]">
              {subject}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-[#eadccf] bg-white p-6">
            <div className="space-y-4 text-sm leading-7 text-[#2d1c13]">
              <p>Dear {supplierOrder.supplier.name},</p>

              <p>
                Please find below a new purchase order from{" "}
                <strong>Kaffee Krümel</strong>.
              </p>

              <div className="rounded-2xl bg-[#fcf8f4] p-4">
                <p>
                  <strong>Main Order:</strong> {mainOrder?.orderNumber}
                </p>
                <p>
                  <strong>Supplier Order:</strong>{" "}
                  {supplierOrder.supplierOrderNumber}
                </p>
                <p>
                  <strong>Branch:</strong> {location?.name}
                </p>
                <p>
                  <strong>City:</strong> {location?.city}
                </p>
                <p>
                  <strong>Order Method:</strong>{" "}
                  {supplierOrder.supplier.orderMethod}
                </p>
                <p>
                  <strong>Supplier Email:</strong>{" "}
                  {supplierOrder.supplier.email}
                </p>
              </div>

              <div>
                <p className="mb-3 font-semibold">Ordered Items</p>

                <div className="overflow-hidden rounded-2xl border border-[#eadccf]">
                  <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr] bg-[#f5ebe2] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a5a43]">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Unit</span>
                    <span>Total</span>
                  </div>

                  <div className="divide-y divide-[#f0e3d7]">
                    {supplierOrder.items?.map((item, index) => (
                      <div
                        key={`${supplierOrder.id}-${index}`}
                        className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr] px-4 py-3 text-sm text-[#2d1c13]"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-[#8b7768]">{item.sku}</p>
                        </div>
                        <span>{item.quantity}</span>
                        <span>{item.unit}</span>
                        <span>€{Number(item.lineTotal || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f3e8dc] px-4 py-3">
                <p className="font-semibold">
                  Supplier Subtotal: €
                  {Number(supplierOrder.subtotalAmount || 0).toFixed(2)}
                </p>
              </div>

              <p>
                Please confirm receipt of this order and proceed according to
                the agreed delivery schedule.
              </p>

              <p>
                Best regards,
                <br />
                Kaffee Krümel Operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
