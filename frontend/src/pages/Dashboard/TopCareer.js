import React, { useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import { useNavigate } from 'react-router-dom'
import { authAPI, userApis } from '~/utils/api'
import styles from './TopCareer.module.scss'
const cx = classNames.bind(styles)

const TopCareer = () => {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 8
  const totalPages = Math.ceil((categories?.length || 0) / itemsPerPage)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await authAPI().get(userApis.getAllCategories)
        setCategories(response.data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Function to get icon based on category name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Software Engineering': 'fa-laptop-code',
      'Marketing': 'fa-bullhorn',
      'Sales': 'fa-tag',
      'Customer Service': 'fa-headset',
      'Human Resources': 'fa-users',
      'Finance': 'fa-landmark',
      'Design': 'fa-palette',
      'Operations': 'fa-cogs',
      // Add more mappings as needed
    }
    return iconMap[categoryName] || 'fa-briefcase' // Default icon
  }

  // Function to get color based on category
  const getCategoryColor = (index) => {
    const colors = [
      '#00B074', '#2F62E9', '#8E59FF', '#FF6B6B',
      '#FFA800', '#00B8D9', '#36B37E', '#FF5630'
    ]
    return colors[index % colors.length]
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = currentPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return categories.slice(startIndex, endIndex)
  }

  const handleCategoryClick = (category) => {
    const searchParams = new URLSearchParams();
    searchParams.append('category_id', category.category_id);
    searchParams.append('category_name', category.category_name);
    navigate(`/user/job-search?${searchParams.toString()}`);
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <h2>
          <i className="fa-solid fa-briefcase"></i>
          Top ngành nghề nổi bật
        </h2>
        <div className={cx('nav-buttons')}>
          <button 
            className={cx('nav-btn', 'prev')} 
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            className={cx('nav-btn', 'next')}
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className={cx('career-grid')}>
        {getCurrentPageItems().map((category, index) => (
          <div 
            key={category.category_id} 
            className={cx('career-card')}
            onClick={() => handleCategoryClick(category)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className={cx('icon-wrapper')}
              style={{ backgroundColor: `${getCategoryColor(index)}15` }}
            >
              <i
                className={`fa-solid ${getCategoryIcon(category.category_name)}`}
                style={{ color: getCategoryColor(index) }}
              ></i>
            </div>
            <div className={cx('content')}>
              <h3 className={cx('title')}>{category.category_name}</h3>
              <span className={cx('count')}>{category.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopCareer 