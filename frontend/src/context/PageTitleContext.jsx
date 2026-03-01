import React, { createContext, useContext, useState } from 'react';

const PageTitleContext = createContext();

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
};

export const PageTitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageSubtitle, setPageSubtitle] = useState('');

  const updatePageTitle = (title, subtitle = '') => {
    setPageTitle(title);
    setPageSubtitle(subtitle);
  };

  return (
    <PageTitleContext.Provider value={{ pageTitle, pageSubtitle, updatePageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};









