from .llm_response_testor_for_hyper_parameter_tuning import test_router
from .chat_tone_analysis import sms_init_router
from .response_generator import sms_router
from .TTSApi import TTSReady_router
from .save_audio_file import audio_router
from .embedding import embedding_router

routers = [test_router, sms_init_router, sms_router,TTSReady_router, audio_router, embedding_router]