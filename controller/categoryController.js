const categoryService = require('../service/categoryService');

class CategoryController {
  async createCategory(ctx) {
    try {
      const categoryData = ctx.request.body;
      const newCategory = await categoryService.createCategory(categoryData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Category created successfully',
        data: newCategory,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCategories(ctx) {
    try {
      const result = await categoryService.getCategories(ctx.query);

      ctx.body = {
        success: true,
        data: result.categories,
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

  async updateCategory(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedCategory = await categoryService.updateCategory(id, updateData);

      ctx.body = {
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      };
    } catch (error) {
      if (error.message === 'Category not found') {
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

  async deleteCategory(ctx) {
    try {
      const { id } = ctx.params;
      await categoryService.deleteCategory(id);

      ctx.body = {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Category not found') {
        ctx.status = 404;
      } else if (error.message.includes('Cannot delete')) {
        ctx.status = 400;
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

module.exports = new CategoryController();
