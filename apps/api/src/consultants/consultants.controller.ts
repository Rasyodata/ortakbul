import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ConsultantsService } from './consultants.service';
import { AnswerQuestionDto, ApplyConsultantDto, AskQuestionDto, QueryConsultantDto } from './dto/consultant.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('consultants')
export class ConsultantsController {
  constructor(private readonly consultants: ConsultantsService) {}

  @Public()
  @Get()
  list(@Query() q: QueryConsultantDto) {
    return this.consultants.publicList(q);
  }

  @Post('apply')
  apply(@CurrentUser('id') userId: string, @Body() dto: ApplyConsultantDto) {
    return this.consultants.apply(userId, dto);
  }

  // Danışman: kendisine gelen sorular
  @Get('questions/mine')
  myQuestions(@CurrentUser('id') userId: string) {
    return this.consultants.myQuestions(userId);
  }

  @Post('questions/:id/answer')
  answer(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: AnswerQuestionDto) {
    return this.consultants.answer(userId, id, dto);
  }

  @Public()
  @Get(':userId')
  getOne(@Param('userId') userId: string) {
    return this.consultants.getByUserId(userId);
  }

  @Post(':userId/questions')
  ask(@CurrentUser('id') fromUserId: string, @Param('userId') userId: string, @Body() dto: AskQuestionDto) {
    return this.consultants.ask(fromUserId, userId, dto);
  }
}
