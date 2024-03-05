import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
    ApiBearerAuth,
    ApiHeader,
    ApiOperation,
    ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from './../auth/decorators/roles.decorator';

@ApiTags('Article')
@Controller('article')
@UseGuards(RolesGuard)
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get All article', })
    @ApiOkResponse({})
    async getAllArticle() {
        return await this.articleService.getAllArticles();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get One article', })
    @ApiParam({ name: 'id', description: 'id of article' })
    @ApiOkResponse({})
    async getOneArticles(@Param() params) {
        return await this.articleService.getOneArticle(params.id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard('jwt'))
    @Roles('admin')
    @ApiOperation({ summary: 'Create one article', })
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.'
    })
    @ApiCreatedResponse({})
    async createArticle(@Body() createArticleDto: CreateArticleDto) {
        return await this.articleService.createArticle(createArticleDto);
    }


    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @Roles('admin')
    @ApiOperation({ summary: 'Update one article by id ( all params )', })
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'id of article' })
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.'
    })
    @ApiOkResponse({})
    async updateWithAllParams(@Param() params, @Body() createArticleDto: CreateArticleDto) {
        return await this.articleService.updateArticlePut(params.id, createArticleDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    @Roles('admin')
    @ApiOperation({ summary: 'Delete one article', })
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.'
    })
    @ApiParam({ name: 'id', description: 'id of article we want to delete.' })
    @ApiOkResponse({})
    async deleteOneArticle(@Param() params) {
        return await this.articleService.deleteArticle(params.id);
    }
}
