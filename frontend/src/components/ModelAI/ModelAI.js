import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ModelAI.module.scss';
import useAgeServices from '~/services/useAgeServices';
 
const cx = classNames.bind(styles);

function ModelAI({ selectedModel , setSelectedModel}) {
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelsResult = await useAgeServices.getAllModelsNLP(); // Giả sử đây là hàm lấy danh sách mô hình
        setModels(modelsResult.models);

        // Thiết lập giá trị mặc định cho selectedModel nếu chưa được thiết lập
        if (!selectedModel && modelsResult.models.length > 0) {
          setSelectedModel(modelsResult.models[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedModel, setSelectedModel]);

  return (
    <div className={cx('formGroup')}>
      <label htmlFor="promptSelect">Chọn mô hình AI</label>
      <select
        id="promptSelect"
        className={cx('select')}
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.map((model, id) => (
          <option key={id} value={model}>
            {model === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'GPT-4o'}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ModelAI;
