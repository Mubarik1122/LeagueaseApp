import Swal from 'sweetalert2';

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An unexpected error occurred';
  
  if (error.message) {
    message = error.message;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  }
  
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  });
};

export const showSuccessMessage = (title, text = null) => {
  Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showLoadingMessage = (title = 'Loading...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoadingMessage = () => {
  Swal.close();
};