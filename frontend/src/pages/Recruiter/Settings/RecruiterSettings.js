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
    founded_year: ''
  })
  const [isCreatingLicense, setIsCreatingLicense] = useState(true)

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
          setBusinessLicense(responseBusinessLicenses.data.businessLicenses[0]);
          setLicenseForm({
            tax_id: responseBusinessLicenses.data.businessLicenses[0].tax_id || '',
            registration_number: responseBusinessLicenses.data.businessLicenses[0].registration_number || '',
            license_issue_date: responseBusinessLicenses.data.businessLicenses[0].license_issue_date?.split('T')[0] || '',
            license_expiry_date: responseBusinessLicenses.data.businessLicenses[0].license_expiry_date?.split('T')[0] || '',
            contact_email: responseBusinessLicenses.data.businessLicenses[0].contact_email || '',
            contact_phone: responseBusinessLicenses.data.businessLicenses[0].contact_phone || '',
            industry: responseBusinessLicenses.data.businessLicenses[0].industry || '',
            founded_year: responseBusinessLicenses.data.businessLicenses[0].founded_year || ''
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
      setFormData(prev => ({...prev, banner: company.banner}))

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

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const formDataToSubmit = {
        ...licenseForm,
        business_license_status: isCreatingLicense ? 'pending' : businessLicense.business_license_status
      };
      
      if (isCreatingLicense) {
        // Create new license
        const response = await authAPI().post(
          recruiterApis.createBusinessLicense(companyInfo.company_id),
          formDataToSubmit
        );
        setBusinessLicense(response.data.businessLicense);
        setIsCreatingLicense(false);
        toast.success("Tạo giấy phép kinh doanh thành công!");
      } else {
        // Update existing license
        const response = await authAPI().put(
          recruiterApis.updateBusinessLicense(businessLicense.license_id),
          formDataToSubmit
        );
        setBusinessLicense(response.data.businessLicense);
        toast.success("Cập nhật giấy phép kinh doanh thành công!");
      }

      setIsEditingLicense(false);

      // Refresh data
      const responseLicense = await authAPI().get(
        recruiterApis.getBusinessLicensesByCompanyId(companyInfo.company_id)
      );
      if (responseLicense.data.businessLicenses.length > 0) {
        setBusinessLicense(responseLicense.data.businessLicenses[0]);
        setLicenseForm({
          tax_id: responseLicense.data.businessLicenses[0].tax_id || '',
          registration_number: responseLicense.data.businessLicenses[0].registration_number || '',
          license_issue_date: responseLicense.data.businessLicenses[0].license_issue_date?.split('T')[0] || '',
          license_expiry_date: responseLicense.data.businessLicenses[0].license_expiry_date?.split('T')[0] || '',
          contact_email: responseLicense.data.businessLicenses[0].contact_email || '',
          contact_phone: responseLicense.data.businessLicenses[0].contact_phone || '',
          industry: responseLicense.data.businessLicenses[0].industry || '',
          founded_year: responseLicense.data.businessLicenses[0].founded_year || ''
        });
      }

    } catch (error) {
      console.error(error);
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

  // Add tab switching handler
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

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
                <h2>
                  <i className="fa-solid fa-certificate"></i>
                  {isCreatingLicense ? "Tạo giấy phép kinh doanh" : "Thông tin giấy phép kinh doanh"}
                </h2>
                {!isCreatingLicense && (
                  <button
                    className={cx("edit-btn")}
                    onClick={() => setIsEditingLicense(true)}
                    disabled={isSubmitting}
                  >
                    <i className="fa-solid fa-pen"></i>
                    Chỉnh sửa
                  </button>
                )}
              </div>

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
                      disabled={!isEditingLicense && !isCreatingLicense}
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
                      disabled={!isEditingLicense && !isCreatingLicense}
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
                      disabled={!isEditingLicense && !isCreatingLicense}
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Ngày hết hạn</label>
                    <input
                      type="date"
                      value={licenseForm.license_expiry_date}
                      onChange={(e) => setLicenseForm(prev => ({
                        ...prev,
                        license_expiry_date: e.target.value
                      }))}
                      disabled={!isEditingLicense && !isCreatingLicense}
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
                      disabled={!isEditingLicense && !isCreatingLicense}
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
                      disabled={!isEditingLicense && !isCreatingLicense}
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
                      disabled={!isEditingLicense && !isCreatingLicense}
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
                      disabled={!isEditingLicense && !isCreatingLicense}
                      placeholder="Nhập năm thành lập"
                    />
                  </div>
                </div>

                <div className={cx("form-actions")}>
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
                    className={cx("save-btn")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        {isCreatingLicense ? "Đang tạo..." : "Đang lưu..."}
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check"></i>
                        {isCreatingLicense ? "Tạo giấy phép" : "Lưu thay đổi"}
                      </>
                    )}
                  </button>
                </div>

                {businessLicense?.business_license_verified_at && (
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

