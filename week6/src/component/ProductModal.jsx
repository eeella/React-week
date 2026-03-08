import React from "react";

function ProductModal({
  modalRef,
  modalType,
  templateProduct,
  handleModalInputChange,
  handleModalImageChange,
  handleAddImage,
  handleRemoveImage,
  updateProduct,
  delProduct,
  uploadImage,
  closeModal,
}) {
  return (
    <div
      ref={modalRef}
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div className={`modal-header ${modalType === "delete" ? "bg-danger" : "bg-dark"} text-white`}>
            <h5 className="modal-title">
              <span>{modalType === "delete" ? "刪除" : modalType === "edit" ? "編輯" : "新增"}產品</span>
            </h5>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            {modalType === "delete" ? (
              <p className="fs-5">
                您確定要刪除這個產品嗎？
                <span className="text-danger">{templateProduct.title}</span>
              </p>
            ) : (
              <div className="row">
                {/* 圖片區 */}
                <div className="col-sm-4">
                  <div className="mb-3">
                    <label htmlFor="fileupload" className="form-label">上傳圖片</label>
                    <input 
                    className="form-control" 
                    type="file" 
                    name="form-fileupload" 
                    id="fileupload" 
                    accept="jpg,png,jpeg"
                    onChange={e => uploadImage(e)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">輸入主圖網址</label>
                    <input
                      name="imageUrl"
                      type="text"
                      className="form-control"
                      placeholder="請輸入圖片連結"
                      value={templateProduct.imageUrl || ""}
                      onChange={handleModalInputChange}
                    />
                    {templateProduct.imageUrl && <img className="img-fluid" src={templateProduct.imageUrl} alt="主圖" />}
                  </div>
                  <div className="mb-3">
                    {templateProduct.imagesUrl?.map((url, index) => (
                      <div key={index} className="mb-2">
                        <label className="form-label">備用圖片 {index + 1}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={url}
                          onChange={(e) => handleModalImageChange(index, e.target.value)}
                        />
                        {url && <img className="img-fluid" src={url} alt={`圖片${index + 1}`} />}
                      </div>
                    ))}
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={handleAddImage}>新增圖片</button>
                      <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={handleRemoveImage}>刪除圖片</button>
                    </div>
                  </div>
                </div>
                {/* 內容區 */}
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">標題</label>
                    <input name="title" type="text" className="form-control" value={templateProduct.title} onChange={handleModalInputChange} />
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">分類</label>
                      <input name="category" type="text" className="form-control" value={templateProduct.category} onChange={handleModalInputChange} />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">單位</label>
                      <input name="unit" type="text" className="form-control" value={templateProduct.unit} onChange={handleModalInputChange} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">原價</label>
                      <input name="origin_price" type="number" min="0" className="form-control" value={templateProduct.origin_price} onChange={handleModalInputChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="price" className="form-label">售價</label>
                      <input name="price" type="number" min="0" className="form-control" value={templateProduct.price} onChange={handleModalInputChange} />
                    </div>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">產品描述</label>
                    <textarea name="description" className="form-control" value={templateProduct.description} onChange={handleModalInputChange}></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">說明內容</label>
                    <textarea name="content" className="form-control" value={templateProduct.content} onChange={handleModalInputChange}></textarea>
                  </div>
                  <div className="form-check">
                    <input name="is_enabled" id="is_enabled" className="form-check-input" type="checkbox" checked={templateProduct.is_enabled} onChange={handleModalInputChange} />
                    <label className="form-check-label" htmlFor="is_enabled">是否啟用</label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>取消</button>
            <button
              type="button"
              className={`btn btn-${modalType === "delete" ? "danger" : "primary"}`}
              onClick={() => (modalType === "delete" ? delProduct(templateProduct.id) : updateProduct())}
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;