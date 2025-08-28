export interface JoinPayload {
    roomId: string;
  }
  
  export type SDPInit = {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
  };

  export interface OfferPayload {
    to: string;
    sdp: SDPInit;
  }
  
  export interface AnswerPayload {
    to: string;
    sdp: SDPInit;
  }

  export type ICECandidateInitLite = {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
  };
  
  export interface CandidatePayload {
    to: string;
    candidate: ICECandidateInitLite;
  }
  
  export interface PeersDTO {
    peers: string[];
  }
  
  export interface PeerJoinedDTO {
    socketId: string;
  }
  
  export interface PeerLeftDTO {
    socketId: string;
  }