import { useEffect, useState, useContext } from "react"
import UserContext from "~/context/UserContext"
import classNames from "classnames/bind"
import styles from "./RecruiterSettings.module.scss"
import { authAPI, recruiterApis } from "~/utils/api"
import { toast } from "react-toastify"
import images from "~/assets/images"

const cx = classNames.bind(styles)

const RecruiterSettings = () => {
  const { user } = useContext(UserContext)
  const [companyInfo, setCompanyInfo] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  // status recruiter company
  const [statusRecruiterCompany, setStatusRecruiterCompany] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    address: "",
    website: "",
    company_emp: "",
    logo: null,
    banner: null,
  })
  const [activeTab, setActiveTab] = useState('info')
  const [businessLicense, setBusinessLicense] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [licenseFile, setLicenseFile] = useState(null)
  const [isEditingLicense, setIsEditingLicense] = useState(false)
  const [licenseForm, setLicenseForm] = useState({
    tax_id: '',
    registration_number: '',
    license_issue_date: '',
    license_expiry_date: '',
    contact_email: '',
    contact_phone: '',
    industry: '',
    founded_year: '',
    business_license_file: null
  })
  const [isCreatingLicense, setIsCreatingLicense] = useState(true)
  const [licenseFilePreview, setLicenseFilePreview] = useState(null)
  // Thêm state để quản lý thông tin hết hạn
  const [expiryStatus, setExpiryStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await authAPI().get(recruiterApis.getCurrentUser)
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies)
        const company = responseCompany.data.companies[0]

        // Check if business license exists
        const responseBusinessLicenses = await authAPI().get(
          recruiterApis.getBusinessLicensesByCompanyId(company.company_id)
        );

        if (responseBusinessLicenses.data.businessLicenses.length > 0) {
          setIsCreatingLicense(false);
          const businessLicense = responseBusinessLicenses.data.businessLicenses[0];
          setBusinessLicense(businessLicense);
          
          // Nếu business license status là verified, không cho phép chỉnh sửa
          if (businessLicense.business_license_status === 'verified') {
            setIsEditingLicense(false);
          }
          
          setLicenseForm({
            tax_id: businessLicense.tax_id || '',
            registration_number: businessLicense.registration_number || '',
            license_issue_date: businessLicense.license_issue_date?.split('T')[0] || '',
            license_expiry_date: businessLicense.license_expiry_date?.split('T')[0] || '',
            contact_email: businessLicense.contact_email || '',
            contact_phone: businessLicense.contact_phone || '',
            industry: businessLicense.industry || '',
            founded_year: businessLicense.founded_year || '',
            business_license_file: businessLicense.business_license_file || null
          });
        } else {
          setIsCreatingLicense(true);
        }

        setCompanyInfo(company)
        setStatusRecruiterCompany(responseCompany.data.recruiterCompanies[0].status)
        setFormData({
          company_name: company.company_name,
          description: company.description,
          address: company.address,
          website: company.website,
          company_emp: company.company_emp,
          logo: company.logo,
          banner: company.banner,
        })
        setLogoPreview(company.logo)
        setBannerPreview(company.banner)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Không thể tải thông tin công ty")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // useEffect kiểm tra hạn giấy phép khi businessLicense thay đổi
  useEffect(() => {
    if (businessLicense && businessLicense.license_expiry_date) {
      const status = checkLicenseExpiry(businessLicense);
      setExpiryStatus(status);
      
      // Nếu giấy phép đã hết hạn và đang ở trạng thái verified, tự động chuyển về pending
      if (status.expired && businessLicense.business_license_status === 'verified') {
        updateLicenseStatusToPending();
      }
    }
  }, [businessLicense]);
  
  // Hàm cập nhật trạng thái giấy phép về pending khi hết hạn
  const updateLicenseStatusToPending = async () => {
    try {
      // Tạo dữ liệu cập nhật với status = pending
      const updateData = {
        ...licenseForm,
        business_license_status: 'pending'
      };
      
      // Gọi API để cập nhật
      const response = await authAPI().put(
        recruiterApis.updateBusinessLicense(businessLicense.license_id),
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.code === 1) {
        setBusinessLicense(response.data.businessLicense);
        toast.warning("Giấy phép kinh doanh đã hết hạn. Trạng thái đã được chuyển về chờ xét duyệt.", {
          position: "top-right",
          autoClose: 5000
        });
        
        // Cập nhật form
        setLicenseForm(prev => ({
          ...prev,
          business_license_status: 'pending'
        }));
      }
    } catch (error) {
      console.error("Error updating license status:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)

      setFormData((prev) => ({
        ...prev,
        logo: file,
      }))
    }
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result)
      }
      reader.readAsDataURL(file)

      setFormData((prev) => ({
        ...prev,
        banner: file,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (key === "logo" && formData[key] instanceof File) {
          formDataToSend.append("logo", formData[key])
        } else if (key !== "logo") {
          formDataToSend.append(key, formData[key])
        }
      })

      await authAPI().put(
        recruiterApis.updateCompany(companyInfo.company_id),
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      toast.success("🎉 Cập nhật thông tin công ty thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating company:", error)
      toast.error("❌ Không thể cập nhật thông tin công ty", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBannerUpload = async () => {
    try {
      setIsLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append("banner", formData.banner)

      await authAPI().put(
        recruiterApis.updateCompanyBanner(companyInfo.company_id),
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      toast.success("🎉 Cập nhật banner công ty thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Refresh data after successful upload
      const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies)
      const company = responseCompany.data.companies[0]
      setBannerPreview(company.banner)
      setFormData(prev => ({ ...prev, banner: company.banner }))

    } catch (error) {
      console.error("Error updating banner:", error)
      toast.error("❌ Không thể cập nhật banner công ty", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLicenseFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicenseFilePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setLicenseFile(file);
    }
  };

  const handleLicenseFileUpload = async () => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("business_license_file", licenseFile);

      await authAPI().put(
        recruiterApis.updateBusinessLicenseFile(businessLicense.license_id),
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("🎉 Cập nhật file giấy phép thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Refresh data after successful upload
      const responseLicense = await authAPI().get(
        recruiterApis.getBusinessLicensesByCompanyId(companyInfo.company_id)
      );
      
      if (responseLicense.data.businessLicenses.length > 0) {
        setBusinessLicense(responseLicense.data.businessLicenses[0]);
        setLicenseForm(prev => ({
          ...prev,
          business_license_file: responseLicense.data.businessLicenses[0].business_license_file
        }));
      }

    } catch (error) {
      console.error("Error updating file giấy phép:", error);
      toast.error("❌ Không thể cập nhật file giấy phép", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý khi thay đổi ngày hết hạn
  const handleExpiryDateChange = (e) => {
    const newExpiryDate = e.target.value;
    
    // Kiểm tra ngày hết hạn mới có hợp lệ không
    const newExpiryDateObj = new Date(newExpiryDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (newExpiryDateObj < currentDate) {
      toast.error("Ngày hết hạn không thể ở quá khứ. Vui lòng chọn ngày trong tương lai.", {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    // Cập nhật state
    setLicenseForm(prev => ({
      ...prev,
      license_expiry_date: newExpiryDate
    }));
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    
    // Nếu đã verified thì không cho phép submit
    if (businessLicense?.business_license_status === 'verified' && !expiryStatus?.expired) {
      toast.info("Giấy phép đã được xác thực và không thể chỉnh sửa", {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    // Kiểm tra ngày hết hạn có hợp lệ không
    if (licenseForm.license_expiry_date) {
      const expiryDate = new Date(licenseForm.license_expiry_date);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (expiryDate < currentDate) {
        toast.error("Ngày hết hạn không thể ở quá khứ. Vui lòng chọn ngày trong tương lai.", {
          position: "top-right",
          autoClose: 3000
        });
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Thêm các trường dữ liệu vào FormData
      Object.keys(licenseForm).forEach(key => {
        formDataToSend.append(key, licenseForm[key]);
      });
      
      // Nếu giấy phép đã hết hạn, tự động đặt lại trạng thái là pending
      if (expiryStatus?.expired) {
        formDataToSend.set('business_license_status', 'pending');
      }

      let response;
      if (isCreatingLicense) {
        // Tạo mới giấy phép
        response = await authAPI().post(
          recruiterApis.createBusinessLicense(companyInfo.company_id),
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.code === 1) {
          setBusinessLicense(response.data.businessLicense);
          setIsCreatingLicense(false);
          
          // Kiểm tra nếu status là verified thì khóa form
          if (response.data.businessLicense.business_license_status === 'verified') {
            setIsEditingLicense(false);
          }
          
          toast.success("Tạo giấy phép kinh doanh thành công");
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi tạo giấy phép");
        }
      } else {
        // Cập nhật thông tin giấy phép
        response = await authAPI().put(
          recruiterApis.updateBusinessLicense(businessLicense.license_id),
          formDataToSend,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.code === 1) {
          const updatedLicense = response.data.businessLicense;
          setBusinessLicense(updatedLicense);
          
          // Kiểm tra hạn mới
          const newExpiryStatus = checkLicenseExpiry(updatedLicense);
          setExpiryStatus(newExpiryStatus);
          
          // Kiểm tra nếu status là verified thì khóa form
          if (updatedLicense.business_license_status === 'verified' && !newExpiryStatus?.expired) {
            setIsEditingLicense(false);
          }
          
          // Update licenseForm with new data
          setLicenseForm({
            tax_id: updatedLicense.tax_id || '',
            registration_number: updatedLicense.registration_number || '',
            license_issue_date: updatedLicense.license_issue_date?.split('T')[0] || '',
            license_expiry_date: updatedLicense.license_expiry_date?.split('T')[0] || '',
            contact_email: updatedLicense.contact_email || '',
            contact_phone: updatedLicense.contact_phone || '',
            industry: updatedLicense.industry || '',
            founded_year: updatedLicense.founded_year || '',
            business_license_file: updatedLicense.business_license_file || null
          });
          
          if (expiryStatus?.expired) {
            toast.success("Cập nhật giấy phép kinh doanh thành công. Trạng thái đã chuyển về chờ xét duyệt.");
          } else {
            toast.success("Cập nhật giấy phép kinh doanh thành công");
          }
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật giấy phép");
        }
      }

      setIsEditingLicense(false);
    } catch (error) {
      console.error("Error submitting business license:", error);
      toast.error("Có lỗi xảy ra khi lưu giấy phép kinh doanh");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm helper để render status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Đang chờ duyệt',
        icon: 'fa-clock'
      },
      active: {
        label: 'Đã duyệt',
        icon: 'fa-check'
      },
      rejected: {
        label: 'Từ chối',
        icon: 'fa-xmark'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div className={cx("status-badge", status)}>
        <i className={`fa-solid ${config.icon}`}></i>
        {config.label}
      </div>
    );
  };

  // Hàm helper để render status badge cho giấy phép kinh doanh
  const renderLicenseStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Đang chờ duyệt',
        icon: 'fa-clock'
      },
      verified: {
        label: 'Đã duyệt',
        icon: 'fa-check'
      },
      rejected: {
        label: 'Từ chối',
        icon: 'fa-xmark'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div className={cx("status-badge", status)}>
        <i className={`fa-solid ${config.icon}`}></i>
        {config.label}
      </div>
    );
  };

  // Add tab switching handler
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Hàm kiểm tra giấy phép hết hạn và xử lý
  const checkLicenseExpiry = (license) => {
    if (!license || !license.license_expiry_date) return false;
    
    const expiryDate = new Date(license.license_expiry_date);
    const currentDate = new Date();
    
    // Đặt giờ về 00:00:00 để so sánh chỉ ngày
    expiryDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    // Tính số ngày còn lại đến hạn
    const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
    
    // Nếu đã hết hạn
    if (daysRemaining < 0) {
      return {
        expired: true,
        daysExpired: Math.abs(daysRemaining),
        message: `Giấy phép đã hết hạn ${Math.abs(daysRemaining)} ngày trước`
      };
    } 
    // Nếu sắp hết hạn (còn 30 ngày hoặc ít hơn)
    else if (daysRemaining <= 30) {
      return {
        expired: false,
        warning: true,
        daysRemaining: daysRemaining,
        message: `Giấy phép sẽ hết hạn trong ${daysRemaining} ngày nữa`
      };
    }
    
    return {
      expired: false,
      warning: false
    };
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <h1>Cài đặt tài khoản nhà tuyển dụng</h1>
          <p>Quản lý thông tin công ty và cài đặt tài khoản của bạn trên JobZone</p>
        </div>

        <div className={cx("tabs")}>
          <button
            className={cx("tab-btn", { active: activeTab === 'info' })}
            onClick={() => handleTabChange('info')}
          >
            <i className="fa-solid fa-building"></i>
            Thông tin công ty
          </button>
          <button
            className={cx("tab-btn", { active: activeTab === 'license' })}
            onClick={() => handleTabChange('license')}
          >
            <i className="fa-solid fa-file-contract"></i>
            Giấy phép kinh doanh
          </button>
        </div>

        <div className={cx("content")}>
          {activeTab === 'info' ? (
            <div className={cx("company-info")}>
              <div className={cx("section-header")}>
                <div className={cx("header-content")}>
                  <h2>Thông tin công ty</h2>
                  {statusRecruiterCompany && renderStatusBadge(statusRecruiterCompany)}
                </div>
                <button
                  className={cx("edit-btn")}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading || statusRecruiterCompany === 'pending' || statusRecruiterCompany === 'rejected'}
                >
                  {isEditing ? (
                    <>
                      <i className="fa-solid fa-times"></i>Hủy chỉnh sửa
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-pen"></i>Chỉnh sửa thông tin
                    </>
                  )}
                </button>
              </div>

              {/* Thêm thông báo khi status là pending hoặc rejected */}
              {statusRecruiterCompany === 'pending' && (
                <div className={cx("status-message", "pending")}>
                  <i className="fa-solid fa-info-circle"></i>
                  Thông tin công ty của bạn đang được xem xét. Vui lòng đợi phê duyệt từ quản trị viên.
                </div>
              )}

              {statusRecruiterCompany === 'rejected' && (
                <div className={cx("status-message", "rejected")}>
                  <i className="fa-solid fa-exclamation-circle"></i>
                  Thông tin công ty của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                </div>
              )}

              <form onSubmit={handleSubmit} className={cx("form")}>
                <div className={cx("logo-upload")}>
                  <label>Logo công ty</label>
                  <div className={cx("logo-container")}>
                    <img
                      src={logoPreview || images.company_default}
                      alt="Company logo"
                      className={cx("logo-preview")}
                    />
                    {isEditing && (
                      <div className={cx("logo-actions")}>
                        <label className={cx("upload-btn")}>
                          <i className="fa-solid fa-upload"></i>
                          Tải logo mới
                          <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                        </label>
                        <p className={cx("logo-hint")}>
                          Khuyến nghị: Hình ảnh định dạng PNG, JPG với kích thước tối thiểu 200x200px
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cx("banner-upload")}>
                  <label>Banner công ty</label>
                  <div className={cx("banner-container")}>
                    <img
                      src={bannerPreview || images.banner_default}
                      alt="Company banner"
                      className={cx("banner-preview")}
                    />
                    {isEditing && (
                      <div className={cx("banner-actions")}>
                        <label className={cx("upload-btn", "banner-btn")}>
                          <i className="fa-solid fa-image"></i>
                          Chọn banner mới
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            style={{ display: "none" }}
                          />
                        </label>
                        {formData.banner instanceof File && (
                          <button
                            type="button"
                            className={cx("upload-btn")}
                            onClick={handleBannerUpload}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Đang tải lên...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                Tải lên banner
                              </>
                            )}
                          </button>
                        )}
                        <p className={cx("banner-hint")}>
                          Khuyến nghị: Hình ảnh định dạng PNG, JPG với kích thước tối thiểu 1200x400px
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cx("form-group")}>
                  <label>
                    Tên công ty
                    <span className={cx("tooltip")}>
                      <i className="fa-solid fa-circle-info tooltip-icon"></i>
                      <span className={cx("tooltip-text")}>Tên đầy đủ của công ty bạn</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    placeholder="Nhập tên công ty của bạn"
                  />
                </div>

                <div className={cx("form-group")}>
                  <label>Mô tả công ty</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    rows={4}
                    placeholder="Mô tả ngắn gọn về công ty, lĩnh vực hoạt động và văn hóa doanh nghiệp"
                  />
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      placeholder="Địa chỉ trụ sở chính"
                    />
                  </div>

                  <div className={cx("form-group")}>
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing || isLoading}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className={cx("form-group")}>
                  <label>Số lượng nhân viên</label>
                  <input
                    type="number"
                    name="company_emp"
                    value={formData.company_emp}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    placeholder="Ví dụ: 50"
                  />
                </div>

                {isEditing && (
                  <div className={cx("form-actions")}>
                    <button
                      type="button"
                      className={cx("cancel-btn")}
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Hủy
                    </button>
                    <button type="submit" className={cx("save-btn")} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            // New business license form
            <div className={cx("business-license")}>
              <div className={cx("section-header")}>
                <div className={cx("header-content")}>
                  <h2>
                    <i className="fa-solid fa-certificate"></i>
                    {isCreatingLicense ? "Tạo giấy phép kinh doanh" : "Thông tin giấy phép kinh doanh"}
                  </h2>
                  {!isCreatingLicense && businessLicense?.business_license_status && 
                    renderLicenseStatusBadge(businessLicense.business_license_status)
                  }
                </div>
                {!isCreatingLicense && (businessLicense?.business_license_status !== 'verified' || expiryStatus?.expired) && (
                  <button
                    className={cx("edit-btn", { "expired-action": expiryStatus?.expired })}
                    onClick={() => setIsEditingLicense(true)}
                    disabled={isSubmitting}
                  >
                    <i className={`fa-solid ${expiryStatus?.expired ? "fa-calendar-plus" : "fa-pen"}`}></i>
                    {expiryStatus?.expired ? "Cập nhật ngày hết hạn" : "Chỉnh sửa"}
                  </button>
                )}
              </div>

              {/* Thông báo trạng thái */}
              {!isCreatingLicense && businessLicense?.business_license_status === 'pending' && (
                <div className={cx("status-message", "pending")}>
                  <i className="fa-solid fa-info-circle"></i>
                  Giấy phép kinh doanh của bạn đang được xem xét. Vui lòng đợi phê duyệt từ quản trị viên.
                </div>
              )}

              {!isCreatingLicense && businessLicense?.business_license_status === 'rejected' && (
                <div className={cx("status-message", "rejected")}>
                  <i className="fa-solid fa-exclamation-circle"></i>
                  Giấy phép kinh doanh của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                </div>
              )}

              {!isCreatingLicense && businessLicense?.business_license_status === 'verified' && (
                <div className={cx("status-message", "verified")}>
                  <i className="fa-solid fa-check-circle"></i>
                  <div>
                    <p className={cx("verified-title")}>Giấy phép kinh doanh của bạn đã được xác thực</p>
                    {businessLicense.business_license_verified_at && (
                      <p className={cx("verified-detail")}>
                        Đã xác thực bởi {businessLicense.business_license_verified_by || "admin"} vào{' '}
                        {new Date(businessLicense.business_license_verified_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Thông báo hết hạn hoặc sắp hết hạn */}
              {!isCreatingLicense && expiryStatus?.expired && (
                <div className={cx("status-message", "expired")}>
                  <i className="fa-solid fa-calendar-xmark"></i>
                  <div>
                    <p className={cx("expired-title")}>Giấy phép kinh doanh của bạn đã hết hạn</p>
                    <p className={cx("expired-detail")}>
                      {expiryStatus.message}. Vui lòng cập nhật ngày hết hạn mới hoặc nộp giấy phép mới.
                    </p>
                  </div>
                </div>
              )}
              
              {!isCreatingLicense && expiryStatus?.warning && (
                <div className={cx("status-message", "warning")}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <div>
                    <p className={cx("warning-title")}>Giấy phép kinh doanh của bạn sắp hết hạn</p>
                    <p className={cx("warning-detail")}>
                      {expiryStatus.message}. Vui lòng chuẩn bị cập nhật giấy phép mới.
                    </p>
                  </div>
                </div>
              )}

              <form className={cx("form")} onSubmit={handleLicenseSubmit}>
                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Mã số thuế</label>
                    <input
                      type="text"
                      value={licenseForm.tax_id}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        tax_id: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                      placeholder="Nhập mã số thuế"
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Số đăng ký kinh doanh</label>
                    <input
                      type="text"
                      value={licenseForm.registration_number}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        registration_number: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                      placeholder="Nhập số đăng ký kinh doanh"
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Ngày cấp</label>
                    <input
                      type="date"
                      value={licenseForm.license_issue_date}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        license_issue_date: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Ngày hết hạn {expiryStatus?.expired && <span className={cx("expiry-label")}>- Đã hết hạn</span>}</label>
                    <input
                      type="date"
                      value={licenseForm.license_expiry_date}
                      onChange={handleExpiryDateChange}
                      className={expiryStatus?.expired ? cx("expired-input") : ""}
                      disabled={(!isEditingLicense && !isCreatingLicense && !expiryStatus?.expired) || 
                               (businessLicense?.business_license_status === 'verified' && !expiryStatus?.expired)}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Email liên hệ</label>
                    <input
                      type="email"
                      value={licenseForm.contact_email}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        contact_email: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                      placeholder="Nhập email liên hệ"
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Số điện thoại liên hệ</label>
                    <input
                      type="tel"
                      value={licenseForm.contact_phone}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        contact_phone: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                      placeholder="Nhập số điện thoại liên hệ"
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Ngành nghề kinh doanh</label>
                    <input
                      type="text"
                      value={licenseForm.industry}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        industry: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                      placeholder="Nhập ngành nghề kinh doanh"
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Năm thành lập</label>
                    <input
                      type="number"
                      value={licenseForm.founded_year}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        founded_year: e.target.value
                      }))}
                      disabled={(!isEditingLicense && !isCreatingLicense) || businessLicense?.business_license_status === 'verified'}
                      placeholder="Nhập năm thành lập"
                    />
                  </div>
                </div>
                {/* link file giấy phép kinh doanh */}
                <div className={cx("license-upload")}>
                  <label>File giấy phép kinh doanh</label>
                  <div className={cx("license-container")}>
                    <img
                      src={licenseFilePreview || businessLicense?.business_license_file || images.banner_default}
                      alt="Giấy phép kinh doanh"
                      className={cx("license-preview")}
                    />
                    {(isEditingLicense || isCreatingLicense) && businessLicense?.business_license_status !== 'verified' && (
                      <div className={cx("license-actions")}>
                        <label className={cx("upload-btn", "license-btn")}>
                          <i className="fa-solid fa-file-arrow-up"></i>
                          Chọn file giấy phép
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleLicenseFileChange}
                            style={{ display: "none" }}
                            disabled={businessLicense?.business_license_status === 'verified'}
                          />
                        </label>
                        {licenseFile && (
                          <button
                            type="button"
                            className={cx("upload-btn", "upload-license-btn")}
                            onClick={handleLicenseFileUpload}
                            disabled={isLoading || businessLicense?.business_license_status === 'verified'}
                          >
                            {isLoading ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Đang tải lên...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                Tải lên file giấy phép
                              </>
                            )}
                          </button>
                        )}
                        <p className={cx("license-hint")}>
                          Khuyến nghị: File PDF hoặc hình ảnh JPG, PNG với kích thước tối thiểu 800x600px
                        </p>
                      </div>
                    )}
                    
                    {businessLicense?.business_license_status === 'verified' && (
                      <div className={cx("verified-file-message")}>
                        <i className="fa-solid fa-shield-check"></i>
                        File giấy phép đã được xác thực và không thể thay đổi
                      </div>
                    )}
                  </div>
                </div>

                <div className={cx("form-actions")}>
                  {(isEditingLicense || isCreatingLicense) && 
                   (businessLicense?.business_license_status !== 'verified' || expiryStatus?.expired) && (
                    <>
                      {isEditingLicense && (
                        <button
                          type="button"
                          className={cx("cancel-btn")}
                          onClick={() => setIsEditingLicense(false)}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </button>
                      )}
                      <button
                        type="submit"
                        className={cx("save-btn", { "expired-action": expiryStatus?.expired })}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            {isCreatingLicense ? "Đang tạo..." : "Đang lưu..."}
                          </>
                        ) : (
                          <>
                            <i className={`fa-solid ${expiryStatus?.expired ? "fa-calendar-check" : "fa-check"}`}></i>
                            {isCreatingLicense ? "Tạo giấy phép" : 
                             expiryStatus?.expired ? "Cập nhật ngày hết hạn" : "Lưu thay đổi"}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {businessLicense?.business_license_status === 'pending' ? (
                  <div className={cx("verification-info-pending", "pending")}>
                    <p>
                      <i className="fa-solid fa-clock"></i>
                      Đang chờ xét duyệt
                    </p>
                  </div>
                ) : businessLicense?.business_license_verified_at && (
                  <div className={cx("verification-info")}>
                    <p>
                      <i className="fa-solid fa-check-circle"></i>
                      Đã xác thực bởi {businessLicense.business_license_verified_by} vào{' '}
                      {new Date(businessLicense.business_license_verified_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecruiterSettings

