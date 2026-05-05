<?php
namespace App\Mail;

use App\Models\Application;
use App\Models\Candidate;
use App\Models\JobOffer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewApplicationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Candidate $candidate,
        public JobOffer $jobOffer,
        public Application $application
    ) {}

    public function build(): static
    {
        $pipelineUrl = env('FRONTEND_URL', 'http://localhost:5173')
            . '/job-offers/' . $this->jobOffer->id . '/pipeline';

        return $this
            ->subject("New Application: {$this->candidate->first_name} {$this->candidate->last_name} → {$this->jobOffer->title}")
            ->html(
                '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#0a0a0a;">'
                . '<h2 style="margin:0 0 16px;">New Application Received</h2>'
                . "<p style=\"margin:0 0 8px;\"><strong>{$this->candidate->first_name} {$this->candidate->last_name}</strong>"
                . " ({$this->candidate->email}) has applied to <strong>{$this->jobOffer->title}</strong>.</p>"
                . "<a href=\"{$pipelineUrl}\" style=\"display:inline-block;margin-top:20px;padding:12px 24px;"
                . "background:#0a0a0a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;\">View in Pipeline</a>"
                . '</div>'
            );
    }
}
