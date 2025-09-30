import React from "react";
import { Layout, Menu } from "antd";
import { AppstoreOutlined, TagsOutlined } from "@ant-design/icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const location = useLocation();

  const selectedKey = React.useMemo(() => {
    if (location.pathname.startsWith("/categories")) return "categories";
    return "products";
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth={0}>
        <div className="text-white text-center py-4 text-lg font-semibold">
          Quản trị
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: "products",
              icon: <AppstoreOutlined />,
              label: <NavLink to="/products">Sản phẩm</NavLink>,
            },
            {
              key: "categories",
              icon: <TagsOutlined />,
              label: <NavLink to="/categories">Danh mục</NavLink>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm flex items-center px-4">
          <div className="font-semibold">Bảng điều khiển</div>
        </Header>
        <Content className="p-6 bg-gray-50">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
