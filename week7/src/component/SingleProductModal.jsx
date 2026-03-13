/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

function SingleProductModal({ modalRef, productDetail, closeModal, addCartItem }) {
    const [qty, setQty] = useState(1);

    // 當產品資料變更時，重置數量為 1
    useEffect(() => {
        setQty(1);
    }, [productDetail]);

    // 強制把庫存轉成數字，如果拿不到或是 0，就預設給 99 (讓加減能動)
    // 這樣可以避免因為庫存讀取失敗導致 qty >= stock 永遠成立
    const stock = (productDetail && productDetail.num) ? Number(productDetail.num) : 99;

    // 加號函式
    const handlePlus = () => {
        if (qty < stock) {
            setQty(prev => prev + 1);
        }
    };

    // 減號函式
    const handleMinus = () => {
        if (qty > 1) {
            setQty(prev => prev - 1);
        }
    };

    return (
        <div className="modal fade" id="productModal" ref={modalRef} tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {productDetail ? productDetail.title : '載入中...'}
                        </h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>

                    <div className="modal-body">
                        {productDetail && (
                            <>
                                {/* 解決圖片空字串報錯 */}
                                {productDetail.imageUrl && (
                                    <img
                                        src={productDetail.imageUrl}
                                        alt={productDetail.title}
                                        className="img-fluid mb-3 w-100"
                                        style={{ objectFit: 'cover', maxHeight: '300px' }}
                                    />
                                )}

                                <p><strong>產品描述：</strong>{productDetail.description || '無描述'}</p>

                                <div className="mb-2">
                                    <span className="badge bg-warning text-dark">
                                        剩餘庫存：{productDetail.num || 0} {productDetail.unit}
                                    </span>
                                </div>

                                <div className="d-flex align-items-center mt-4">
                                    <strong className="me-3">購買數量：</strong>

                                    <div className="input-group" style={{ width: '150px' }}>
                                        <button
                                            className="btn btn-outline-secondary text-primary fw-bold"
                                            type="button"
                                            onClick={handleMinus}
                                            disabled={qty <= 1}
                                        >
                                            －
                                        </button>

                                        <input
                                            type="number"
                                            className="form-control text-center fw-bold"
                                            value={qty}
                                            readOnly
                                        />

                                        <button
                                            className="btn btn-outline-secondary text-primary fw-bold"
                                            type="button"
                                            onClick={handlePlus}
                                            disabled={qty >= stock}
                                        >
                                            ＋
                                        </button>
                                    </div>
                                </div>

                                {qty >= stock && (
                                    <small className="text-danger d-block mt-2">
                                        * 已達庫存上限
                                    </small>
                                )}
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>關閉</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!productDetail || productDetail.num === 0}
                            onClick={() => {
                                addCartItem(productDetail.id, qty);
                                closeModal();
                            }}
                        >
                            {productDetail?.num === 0 ? "已售完" : "加入購物車"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleProductModal;