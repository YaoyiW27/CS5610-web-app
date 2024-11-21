import React from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

const BookModal = ({ book, onClose, isOpen }) => {
  const navigate = useNavigate();

  if (!isOpen || !book) return null;
  
  const googleBooksId = book.id;

  const {
    volumeInfo: {
      title = 'No title available',
      authors = ['Unknown author'],
      description = 'No description available',
      averageRating = 0,
      ratingsCount = 0,
      publishedDate = 'No date available',
    } = {},
  } = book || {};

  // 使用 DOMPurify 清理描述内容
  const sanitizedDescription = DOMPurify.sanitize(description);

  // 生成星级评分
  const renderStars = () => {
    const stars = [];
    const rating = Math.round(averageRating * 2) / 2; // 四舍五入到最近的 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else if (i - 0.5 === rating) {
        stars.push(
          <span key={i} className="star half-filled">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  // 处理书名点击事件，导航到书籍详情页面
  const handleTitleClick = () => {
    onClose(); // 关闭模态框
    navigate(`/book/${googleBooksId}`); // 使用书籍的 googleBooksId 导航到详情页面
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <h2
            onClick={handleTitleClick}
            style={{ cursor: 'pointer', color: '#007bff' }}
          >
            {title}
          </h2>
          <p className="modal-author">
            by {Array.isArray(authors) ? authors.join(', ') : authors}
          </p>
        </div>
        <div className="modal-rating">
          <div className="stars">{renderStars()}</div>
          <span className="rating-text">
            {averageRating?.toFixed(2) || 'No'} avg rating —{' '}
            {ratingsCount || 0} ratings
            {publishedDate && ` — published ${publishedDate.substring(0, 4)}`}
          </span>
        </div>
        {/* 使用 dangerouslySetInnerHTML 渲染描述 */}
        <div
          className="modal-description"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        ></div>
      </div>
    </div>
  );
};

export default BookModal;