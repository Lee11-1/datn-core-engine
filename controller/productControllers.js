const productService = require('../service/productService');

class ProductController {
  async createProduct(ctx) {
    try {
      const productData = ctx.request.body;
      const newProduct = await productService.createProduct(productData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Product created successfully',
        data: newProduct,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getProducts(ctx) {
    try {
      const result = await productService.getProducts(ctx.query);

      ctx.body = {
        success: true,
        data: result.products,
        pagination: result.pagination,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getProductById(ctx) {
    try {
      const { id } = ctx.params;
      const product = await productService.getProductById(id);

      ctx.body = {
        success: true,
        data: product,
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateProduct(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedProduct = await productService.updateProduct(id, updateData);

      ctx.body = {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        ctx.status = 404;
      } else {
        ctx.status = 400;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteProduct(ctx) {
    try {
      const { id } = ctx.params;
      await productService.deleteProduct(id);

      ctx.body = {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getProductsBySKU(ctx) {
    try {
      const { skus } = ctx.request.body;
      
      if (!skus || !Array.isArray(skus) || skus.length === 0) {
        throw new Error('Invalid SKUs: must provide a non-empty array');
      }

      const products = await productService.getProductsBySKU(skus);

      ctx.body = {
        success: true,
        data: products,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getProductsByCategory(ctx) {
    try {
      const { categoryId } = ctx.params;
      const { limit = 10, offset = 0 } = ctx.query;

      const result = await productService.getProductsByCategory(
        categoryId,
        parseInt(limit),
        parseInt(offset)
      );

      ctx.body = {
        success: true,
        data: result.products,
        total: result.total,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async searchProducts(ctx) {
    try {
      const { keyword, limit = 20 } = ctx.query;

      if (!keyword || keyword.trim() === '') {
        throw new Error('Search keyword is required');
      }

      const products = await productService.searchProducts(keyword, parseInt(limit));

      ctx.body = {
        success: true,
        data: products,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async activateProduct(ctx) {
    try {
      const { id } = ctx.params;
      const product = await productService.activateProduct(id);

      ctx.body = {
        success: true,
        message: 'Product activated successfully',
        data: product,
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deactivateProduct(ctx) {
    try {
      const { id } = ctx.params;
      const product = await productService.deactivateProduct(id);

      ctx.body = {
        success: true,
        message: 'Product deactivated successfully',
        data: product,
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new ProductController();
