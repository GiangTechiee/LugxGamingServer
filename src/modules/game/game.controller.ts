import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { GamesService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('games')
@UseInterceptors(TransformInterceptor)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  //GET /games?take=12&skip=0
  @Get()
  findAll(
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 12,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
  ) {
    return this.gamesService.findAll(+take, +skip);
  }

  // Lấy games mới cập nhật
  @Get('latest')
  async getLatestGames(
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 12,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
  ) {
    return this.gamesService.findByLatestUpdate(+take, +skip);
  }

  // Lấy games hot
  @Get('hot')
  async getHotGames(
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 12,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
  ) {
    return this.gamesService.findHotGames(+take, +skip);
  }

  @Get('genre/:genreId')
  findByGenre(
    @Param('genreId', ParseIntPipe) genreId: number,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 12,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
  ) {
    return this.gamesService.findByGenre(+genreId, +take, +skip);
  }

  @Get('platform/:platformName')
  findByPlatformName(
    @Param('platformName') platformName: string,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 12,
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
  ) {
    return this.gamesService.findByPlatformName(platformName, +take, +skip);
  }

  @Get('random')
  async findRandomGameId() {
    return this.gamesService.findRandomGameId();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gamesService.update(id, updateGameDto);
  }

  // Cập nhật trạng thái hot
  @Patch(':id/hot-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateHotStatus(
    @Param('id') id: string,
    @Body('isHot') isHot: boolean,
  ) {
    return this.gamesService.updateHotStatus(+id, isHot);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }
}
